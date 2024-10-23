<!-- enterprise_prompt.md -->
### Scenario: Implementing Secure Authentication in SecureApp

**Background:** SecureApp is a cloud-based enterprise application used by organizations to manage sensitive data and workflows. To enhance security, the development team decides to implement secure authentication methods following industry best practices.

#### User Experience:

1. **Onboarding New Administrators:**
   - When a new administrator logs in to SecureApp for the first time, they are greeted with a welcome message and guided to configure secure authentication settings.

2. **Configuring Authentication:**
   - The administrator navigates to the "Security Settings" section within SecureApp's dashboard.
   - They encounter a prompt titled "Configure Secure Authentication for SecureApp" with detailed instructions.

3. **Following the Instructions:**
   - The administrator reads through the prompt, understanding the objective of configuring secure authentication to protect sensitive data.
   - They follow the provided steps, such as enabling multi-factor authentication (MFA), integrating with an identity provider (IdP), and configuring single sign-on (SSO).

4. **Validation and Best Practices:**
   - After completing the configuration steps, the administrator validates the setup by testing user logins with MFA and verifying successful SSO authentication.
   - They review best practices for maintaining secure authentication, such as regularly updating policies and monitoring authentication logs.

5. **Troubleshooting:**
   - If the administrator encounters any issues during setup, they refer to the troubleshooting section of the prompt.
   - Common troubleshooting steps include verifying selected authentication methods and checking IdP configurations for errors.

6. **Accessing Additional Resources:**
   - For further assistance, the administrator can access additional resources provided in the prompt, such as documentation on authentication setup or contacting IT support.

#### Integration with SecureApp:

- The `EnterprisePrompt` class is integrated into SecureApp's onboarding process and security settings section.
- Administrators can access the prompt directly from the dashboard, ensuring easy access to guidance on configuring secure authentication.
- The prompt serves as a comprehensive resource, providing step-by-step instructions, validation guidelines, best practices, troubleshooting tips, and additional resources.

#### Benefits:

- **User Empowerment:** Administrators feel empowered to configure secure authentication confidently, knowing they have comprehensive guidance at their disposal.
- **Security Compliance:** SecureApp meets industry security standards by implementing secure authentication methods following best practices.
- **Reduced Support Burden:** The prompt reduces the need for extensive support queries by providing self-service guidance for administrators.

By integrating the `EnterprisePrompt` class into SecureApp's user experience, organizations can ensure that administrators can effectively configure secure authentication, thus enhancing the overall security posture of the application.
