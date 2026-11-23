import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { siteBase } from "@/lib/qr";
import PassportView from "@/components/PassportView";

export default async function MyPassport({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login");

  const credentials = await prisma.credential.findMany({
    where: { userId: user.id },
    include: { submission: true },
    orderBy: { issuedAt: "desc" },
  });

  const passportId = user.passportId || user.id;
  const publicUrl = `${siteBase()}/p/${passportId}`;

  return (
    <main className="wrap narrow" style={{ padding: "40px 22px 70px" }}>
      <div className="between no-print">
        <div>
          <div className="kicker">Shareable, verifiable, yours</div>
          <h1 style={{ fontSize: 38 }} className="mt-s">
            My skill passport
          </h1>
        </div>
        <div className="row">
          <Link href="/challenges" className="btn btn-primary btn-sm">
            Add a skill
          </Link>
          <Link href={`/p/${passportId}`} className="btn btn-sm">
            Public view
          </Link>
        </div>
      </div>
      <div className="mt-l">
        <PassportView
          user={user}
          credentials={credentials.map((c) => ({
            publicId: c.publicId,
            title: c.title,
            skill: c.skill,
            score: c.score,
            level: c.level,
            issuedAt: c.issuedAt,
            evidenceHash: c.evidenceHash,
            evidenceUrl: c.submission?.evidenceUrl,
          }))}
          publicUrl={publicUrl}
          lang={lang}
          basePath="/passport"
        />
      </div>
    </main>
  );
}
