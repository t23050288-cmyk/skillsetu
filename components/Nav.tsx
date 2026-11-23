import Link from "next/link";
import { currentUser } from "@/lib/auth";

export default async function Nav() {
  const user = await currentUser();
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">से</span> SkillSetu
        </Link>
        <div className="nav-links">
          <Link href="/challenges">Challenges</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/passport" className="hide-sm">My passport</Link>
          <Link href="/employer" className="hide-sm">For employers</Link>
          {user ? (
            <Link href="/dashboard" className="btn btn-sm btn-primary">
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/login" className="btn btn-sm btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
