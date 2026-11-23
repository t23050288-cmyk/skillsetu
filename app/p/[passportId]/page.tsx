import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { siteBase } from "@/lib/qr";
import PassportView from "@/components/PassportView";

export default async function PublicPassport({
  params,
  searchParams,
}: {
  params: Promise<{ passportId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { passportId } = await params;
  const { lang } = await searchParams;

  const user = await prisma.user.findFirst({
    where: { OR: [{ passportId }, { id: passportId }] },
    include: {
      credentials: { include: { submission: true }, orderBy: { issuedAt: "desc" } },
    },
  });

  if (!user) notFound();

  return (
    <main className="wrap narrow" style={{ padding: "40px 22px 70px" }}>
      <div className="kicker no-print">Public passport · anyone with this link can verify</div>
      <div className="mt-l">
        <PassportView
          user={user}
          credentials={user.credentials.map((c) => ({
            publicId: c.publicId,
            title: c.title,
            skill: c.skill,
            score: c.score,
            level: c.level,
            issuedAt: c.issuedAt,
            evidenceHash: c.evidenceHash,
            evidenceUrl: c.submission?.evidenceUrl,
          }))}
          publicUrl={`${siteBase()}/p/${user.passportId || user.id}`}
          lang={lang}
          basePath={`/p/${passportId}`}
        />
      </div>
    </main>
  );
}
