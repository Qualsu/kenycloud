import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Header(){
    return (
    <div className="border-b py-4 bg-white-light animate-fade-down animate-duration-700 animate-delay-[1000ms] animate-ease-in-out">
        <div className="container mx-auto justify-between flex items-center">
            <Link href="/">
                <h1 className="text-main-whitedark font-bold filter flex items-center">
                    <span className="text-main-grey">Keny</span>Cloud
                </h1>
            </Link>
            <div className="flex gap-2">
                <OrganizationSwitcher/>
                <UserButton/>
                <SignedOut>
                    <SignInButton>
                        <Button>Войти</Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>
    </div>
    )
}