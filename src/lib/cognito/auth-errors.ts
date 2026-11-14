export function cognitoAuthErrorMessage(err: unknown): string {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : "";

  switch (name) {
    case "NotAuthorizedException":
      return "Incorrect email or password.";
    case "UserNotFoundException":
      return "No account found for this email.";
    case "UserNotConfirmedException":
      return "Account not confirmed. Check your email for a verification link.";
    case "PasswordResetRequiredException":
      return "You must reset your password before signing in.";
    case "InvalidPasswordException":
      return "Password does not meet security requirements.";
    case "CodeMismatchException":
      return "Invalid verification code.";
    case "ExpiredCodeException":
      return "Verification code expired. Request a new one.";
    case "LimitExceededException":
    case "TooManyRequestsException":
      return "Too many attempts. Please wait and try again.";
    case "InvalidParameterException":
      if (message.includes("USER_PASSWORD_AUTH")) {
        return "Sign-in is not enabled for this app client. Enable USER_PASSWORD_AUTH on the Cognito app client.";
      }
      if (message.toLowerCase().includes("phone")) {
        return "Use your 10-digit mobile number (Cognito username is phone).";
      }
      if (message.toLowerCase().includes("gender")) {
        return "Choose a gender to finish setting your password.";
      }
      return message || "Invalid request.";
    default:
      return message || "Authentication failed.";
  }
}
