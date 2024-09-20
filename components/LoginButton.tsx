import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  const { isSignedIn, user } = useUser()
  
  if (isSignedIn) {
    return (
      <>
        Signed in as {user.primaryEmailAddress?.emailAddress} <br />
        <SignOutButton>
          <Button>Sign out</Button>
        </SignOutButton>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <SignInButton>
        <Button>Sign in</Button>
      </SignInButton>
    </>
  )
}