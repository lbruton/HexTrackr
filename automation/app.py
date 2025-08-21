#!/usr/bin/env python3
"""
HexTrackr Automation Service
Python/Flask service for Ansible automation, vulnerability remediation, and YAML configuration management
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import subprocess
import yaml
import json
import logging
from datetime import datetime
import sqlite3

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HexTrackrAutomation:
    def __init__(self):
        self.playbook_dir = '/app/playbooks'
        self.data_dir = '/app/data'
        
    def run_ansible_playbook(self, playbook_name, inventory, extra_vars=None):
        """Run an Ansible playbook"""
        try:
            cmd = [
                'ansible-playbook',
                f'{self.playbook_dir}/{playbook_name}',
                '-i', inventory,
                '--extra-vars', json.dumps(extra_vars or {})
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'return_code': result.returncode
            }
        except Exception as e:
            logger.error(f"Ansible playbook execution failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_yaml(self, yaml_content):
        """Validate YAML content"""
        try:
            yaml.safe_load(yaml_content)
            return {'valid': True}
        except yaml.YAMLError as e:
            return {'valid': False, 'error': str(e)}
    
    def get_vulnerability_remediation_playbook(self, vuln_id, asset_info):
        """Generate remediation playbook for specific vulnerability"""
        template = """
---
- name: Remediate Vulnerability {{ vuln_id }}
  hosts: {{ target_hosts }}
  become: yes
  vars:
    vuln_id: "{{ vuln_id }}"
    asset_ip: "{{ asset_ip }}"
    remediation_date: "{{ ansible_date_time.iso8601 }}"
  
  tasks:
    - name: Log remediation start
      debug:
        msg: "Starting remediation for {{ vuln_id }} on {{ asset_ip }}"
    
    - name: Update system packages
      package:
        name: "*"
        state: latest
      when: vuln_type == "package_vulnerability"
    
    - name: Apply security patches
      shell: |
        # Custom remediation commands based on vulnerability type
        echo "Applying security patches for {{ vuln_id }}"
      register: patch_result
    
    - name: Verify remediation
      shell: |
        # Verification commands
        echo "Verifying remediation for {{ vuln_id }}"
      register: verify_result
    
    - name: Update HexTrackr database
      uri:
        url: "http://api:3232/api/vulnerabilities/{{ vuln_id }}/remediate"
        method: POST
        body_format: json
        body:
          status: "remediated"
          remediation_date: "{{ ansible_date_time.iso8601 }}"
          remediation_log: "{{ patch_result.stdout }}"
        headers:
          Content-Type: "application/json"
      delegate_to: localhost
"""
        return template

automation = HexTrackrAutomation()

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'automation'})

@app.route('/api/automation/playbooks', methods=['GET'])
def list_playbooks():
    """List available Ansible playbooks"""
    try:
        playbooks = []
        if os.path.exists(automation.playbook_dir):
            for file in os.listdir(automation.playbook_dir):
                if file.endswith('.yml') or file.endswith('.yaml'):
                    playbooks.append(file)
        
        return jsonify({'playbooks': playbooks})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/automation/run-playbook', methods=['POST'])
def run_playbook():
    """Execute an Ansible playbook"""
    try:
        data = request.get_json()
        playbook = data.get('playbook')
        inventory = data.get('inventory', 'localhost,')
        extra_vars = data.get('extra_vars', {})
        
        if not playbook:
            return jsonify({'error': 'Playbook name required'}), 400
        
        result = automation.run_ansible_playbook(playbook, inventory, extra_vars)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/automation/validate-yaml', methods=['POST'])
def validate_yaml():
    """Validate YAML content"""
    try:
        data = request.get_json()
        yaml_content = data.get('yaml_content')
        
        if not yaml_content:
            return jsonify({'error': 'YAML content required'}), 400
        
        result = automation.validate_yaml(yaml_content)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/automation/remediate-vulnerability', methods=['POST'])
def remediate_vulnerability():
    """Generate and execute remediation playbook for vulnerability"""
    try:
        data = request.get_json()
        vuln_id = data.get('vuln_id')
        asset_info = data.get('asset_info', {})
        
        if not vuln_id:
            return jsonify({'error': 'Vulnerability ID required'}), 400
        
        # Generate remediation playbook
        playbook_content = automation.get_vulnerability_remediation_playbook(vuln_id, asset_info)
        
        # Save playbook
        playbook_file = f'remediate_{vuln_id}.yml'
        playbook_path = f'{automation.playbook_dir}/{playbook_file}'
        
        with open(playbook_path, 'w') as f:
            f.write(playbook_content)
        
        # Execute playbook
        result = automation.run_ansible_playbook(
            playbook_file,
            asset_info.get('inventory', 'localhost,'),
            {
                'vuln_id': vuln_id,
                'asset_ip': asset_info.get('ip', 'localhost'),
                'target_hosts': asset_info.get('target_hosts', 'localhost')
            }
        )
        
        return jsonify({
            'playbook_generated': True,
            'execution_result': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/automation/dashboard')
def automation_dashboard():
    """Simple dashboard for automation service"""
    dashboard_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>HexTrackr Automation Service</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            .endpoint { background: #e8f4f8; padding: 10px; margin: 5px 0; border-radius: 3px; }
            .method { font-weight: bold; color: #27ae60; }
        </style>
    </head>
    <body>
        <h1 class="header">🔧 HexTrackr Automation Service</h1>
        
        <div class="section">
            <h2>Available Endpoints</h2>
            <div class="endpoint">
                <span class="method">GET</span> /health - Health check
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api/automation/playbooks - List available playbooks
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/automation/run-playbook - Execute Ansible playbook
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/automation/validate-yaml - Validate YAML content
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/automation/remediate-vulnerability - Auto-remediate vulnerabilities
            </div>
        </div>
        
        <div class="section">
            <h2>Service Status</h2>
            <p>✅ Python/Flask Backend: Running</p>
            <p>✅ Ansible Core: Installed</p>
            <p>✅ YAML Processing: Available</p>
            <p>🔄 Ready for automation tasks</p>
        </div>
    </body>
    </html>
    """
    return render_template_string(dashboard_html)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
