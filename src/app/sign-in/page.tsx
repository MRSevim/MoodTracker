import Container from "@/components/Container";
import SignIn from "@/features/auth/components/SignIn";

export default async function Home() {
  return (
    <Container>
      <SignIn />
    </Container>
  );
}
