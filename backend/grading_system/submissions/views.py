from rest_framework import viewsets, permissions
from .models import Submission
from .serializers import SubmissionSerializer
from assignments.models import TestCase
from .grading import grade_submission as grade_code
from plagiarism.services import check_assignment_plagiarism
from plagiarism.models import PlagiarismReport


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lecturer':
            return Submission.objects.all()
        return Submission.objects.filter(student=user)

    def perform_create(self, serializer):
        submission = serializer.save(student=self.request.user)

        # Step 1: Grade submission
        self.grade_submission(submission)

        # Step 2: Run plagiarism detection
        check_assignment_plagiarism(submission.assignment.id)

        # Step 3: Update plagiarism scores
        self.update_plagiarism_scores(submission.assignment.id)

    def grade_submission(self, submission):
        assignment = submission.assignment

        # Get all test cases (hidden included)
        test_cases = TestCase.objects.filter(assignment=assignment)

        total_grade, breakdown, feedback = grade_code(
            submission.code_file,
            assignment,
            test_cases
        )

        submission.grade = total_grade
        submission.feedback = feedback
        submission.grading_breakdown = breakdown
        submission.save()

    def update_plagiarism_scores(self, assignment_id):
        # Get all plagiarism reports for this assignment
        reports = PlagiarismReport.objects.filter(
            assignment_id = submission.assignment.id
        )

        # Reset all submission plagiarism scores first
        submissions = Submission.objects.filter(
            assignment_id=assignment_id
        )

        for sub in submissions:
            sub.plagiarism_score = 0
            sub.save()

        # Apply highest similarity score from reports
        for report in reports:
            sub1 = report.submission1
            sub2 = report.submission2
            similarity = report.similarity_score

            if similarity > sub1.plagiarism_score:
                sub1.plagiarism_score = similarity
                sub1.save()

            if similarity > sub2.plagiarism_score:
                sub2.plagiarism_score = similarity
                sub2.save()