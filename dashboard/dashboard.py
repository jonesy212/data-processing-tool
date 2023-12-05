from flask import Flask, render_template
from flask_login import login_required

app = Flask(__name__)

@app.route('/dashboard')
@login_required
def user_dashboard():
    # You can pass data from the backend to the frontend if needed
    data = {"datasets": ["dataset1", "dataset2"], "tasks": ["task1", "task2"]}
    return render_template('dashboard.html', data=data)

if __name__ == '__main__':
    app.run()
