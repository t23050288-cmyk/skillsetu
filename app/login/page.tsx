import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="wrap narrow" style={{ padding: "60px 22px 80px" }}>
      <div className="kicker">Sign in</div>
      <h1 style={{ fontSize: 40 }} className="mt-s">
        One email. One code. No password to forget.
      </h1>
      <p className="lede mt-s">
        Demo build: the six-digit code is shown on screen instead of being emailed, so the flow works without an SMTP
        account at the venue.
      </p>
      <div className="card mt-l">
        <LoginForm />
      </div>
      <div className="card card-tint mt-m">
        <div className="kicker">Demo accounts</div>
        <ul className="list-clean">
          <li>
            <span className="tag">learner</span>
            <span className="small">arjun@skillsetu.in · 3 verified skills, 1 live application</span>
          </li>
          <li>
            <span className="tag">employer</span>
            <span className="small">meera@kiranaworks.in · 3 open roles, 2 applicants</span>
          </li>
        </ul>
      </div>
    </main>
  );
}
