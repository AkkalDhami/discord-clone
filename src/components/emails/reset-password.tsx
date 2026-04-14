import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  name: string;
  code: string;
  email: string;
}

export const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { name, code, email } = props;

  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Preview>Reset your password</Preview>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-150 rounded-xl bg-white p-10 shadow-sm">
            <Section className="mb-8 text-center">
              <Heading className="m-0 mb-2 text-[28px] font-bold text-gray-900">
                Reset Your Password
              </Heading>
              <Text className="m-0 text-[16px] text-gray-600">
                We received a request to reset your password
              </Text>
            </Section>

            <Section className="mb-8">
              <Text className="m-0 mb-4 text-[16px] leading-6 text-gray-700">
                Hello, {name}
              </Text>
              <Text className="m-0 mb-4 text-[16px] leading-6 text-gray-700">
                We received a password reset request for your account associated
                with <strong>{email}</strong>.
              </Text>
            </Section>

            <Section className="mb-8">
              <Text className="m-0 mb-4 text-[16px] leading-6 text-gray-700">
                Please use the following OTP code to reset your password:
              </Text>
              <Text className="m-0 text-[16px] leading-6 text-gray-700">
                {code}
              </Text>
            </Section>

            <Section className="mb-8">
              <Text className="m-0 mb-4 text-[16px] leading-6 text-gray-700">
                This OTP code will expire in 5 minutes.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
