from flask import Flask, render_template
from flask_login import login_required

from configs.config import app
from database.generators.dashboard_data_generator import get_dashboard_data


@app.route('/dashboard')
@login_required
def user_dashboard():
    # You can pass data from the backend to the frontend if needed
    data = {"datasets": ["dataset1", "dataset2"], "tasks": ["task1", "task2"]}
    return render_template('dashboard.html', data=data)


# dashboard/dashboard.py
from flask import render_template


def render_dashboard(username, user_tier):
    # Implement your logic to fetch and prepare data for the dashboard
    dashboard_data = get_dashboard_data(username, user_tier)

    # Render the dashboard template with the prepared data
    return render_template('Dashboard.tsx', dashboard_data=dashboard_data)
