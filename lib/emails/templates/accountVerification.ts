import { compileTemplate } from '#/lib/utils';
import template from '#/lib/emails/templates/accountVerification.template';

interface EmailVariables {
  email: string;
  firstName: string;
  verificationCode: string;
  verifyAccountLink: string;
};

const accountVerificationEmailTemplate = (variables: EmailVariables): string => {
	try {
		const compiledHTML = compileTemplate(template, variables);

		return compiledHTML;
	} catch (error) {
		console.error('Error compiling email template [accountVerification]:>>', error);
		return '';
	}
};

export default accountVerificationEmailTemplate;
