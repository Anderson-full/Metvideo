// app/api/enviar-convite/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, turma, inviteLink } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Mentoria Comunique com Autoridade <onboarding@resend.dev>",
      to: [email],
      subject: `Seu acesso à Mentoria Comunique com Autoridade (${turma}) foi liberado`,
      html: `
        <div style="background-color: #000000; color: #F5F5F5; padding: 40px 24px; font-family: Arial, sans-serif;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #121212; border: 1px solid #262626; border-radius: 12px; padding: 32px;">
            <p style="color: #A3A3A3; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">
              Mentoria
            </p>
            <h1 style="color: #FFFFFF; font-size: 22px; margin: 0 0 8px 0; line-height: 1.2;">
              COMUNIQUE COM AUTORIDADE<span style="color: #E50914;">.</span>
            </h1>
            <p style="color: #E50914; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin: 0 0 24px 0;">
              Acesso Liberado • Turma ${turma}
            </p>
            <p style="color: #E5E5E5; font-size: 15px; line-height: 1.6;">
              Olá, <strong>${name}</strong>!
            </p>
            <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6;">
              O seu e-mail foi cadastrado no sistema da <strong>Mentoria Comunique com Autoridade</strong>. Clique no botão abaixo para criar sua senha pessoal e acessar o conteúdo exclusivo da <strong>${turma}</strong>:
            </p>
            <div style="margin: 32px 0;">
              <a href="${inviteLink}" style="background-color: #E50914; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Criar Minha Senha e Acessar
              </a>
            </div>
            <p style="color: #737373; font-size: 12px; margin-top: 24px;">
              Se o botão não funcionar, copie e cole este link no navegador:<br/>
              <a href="${inviteLink}" style="color: #E50914;">${inviteLink}</a>
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno ao enviar e-mail." }, { status: 500 });
  }
}