# deployment.py
from flask import render_template

from configs.config import app


@app.route('/deployment')
def deployment():
    # Add deployment-related information
    deployment_info = {
        'deployment_status': 'Live',
        'server_address': 'http://your-server-address.com',
        'contact_email': 'support@your-app.com'
    }
    return render_template('deployment_info.html', deployment_info=deployment_info)
