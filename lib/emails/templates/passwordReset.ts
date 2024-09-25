import { compileTemplate } from '#/lib/utils';
import template from '#/lib/emails/templates/passwordReset.template';

interface EmailVariables {
  email: string;
  firstName: string;
  passwordResetLink: string;
};

const passwordResetEmailTemplate = (variables: EmailVariables): string => {
	try {
		const compiledHTML = compileTemplate(template, variables);

		return compiledHTML;
	} catch (error) {
		console.error('Error compiling email template [passwordReset]:>>', error);
		return '';
	}
};

export default passwordResetEmailTemplate;
