import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import RoleForm from "@/components/RoleForm";

export default async function NewRole() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <main className="wrap narrow" style={{ padding: "40px 22px 70px" }}>
      <div className="kicker">Post an opportunity</div>
      <h1 style={{ fontSize: 38 }} className="mt-s">
        Say what the work needs, not who to hire.
      </h1>
      <p className="lede mt-s">
        List the skills and the pay. Learners see their match before applying, and you see evidence instead of
        resumes.
      </p>
      <div className="card mt-l">
        <RoleForm org={user.name} city={user.city || "Bengaluru"} />
      </div>
    </main>
  );
}
