from django.db import models
from django.conf import settings
from assignments.models import Assignment

class Submission(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    code_file = models.FileField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.FloatField(null=True, blank=True)  # percentage or points
    feedback = models.TextField(blank=True, default='')
    
    plagiarism_score = models.FloatField(default=0.0)
    plagiarism_feedback = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"