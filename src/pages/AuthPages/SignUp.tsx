import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear cuenta | Places Hub"
        description="Crea tu cuenta en Places Hub y empieza a descubrir negocios por área geográfica."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
