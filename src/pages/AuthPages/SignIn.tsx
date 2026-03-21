import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar sesión | Places Hub"
        description="Ingresa a tu cuenta en Places Hub"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
