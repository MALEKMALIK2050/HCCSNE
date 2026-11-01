import { sendEmail } from './mail';
import prisma from './prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function getRoleBadge(role) {
  switch (role) {
    case 'COORDINATOR':
      return '⭐ Coordonnateur Général';
    case 'LEADER':
      return '🔷 Chef de Commission';
    case 'ADMIN':
      return '🟢 Administrateur';
    default:
      return '🔹 Membre du Conseil';
  }
}

function buildEmailHtml({ title, senderName, senderRole, senderSpecialty, messageContent, channelLabel, actionUrl }) {
  return `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Official Algerian Green & Gold Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #006233 0%, #004d26 100%); padding: 26px 30px; text-align: center; border-bottom: 3px solid #C8A951;">
              <div style="color: #ffffff; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; opacity: 0.95;">
                République Algérienne Démocratique et Populaire
              </div>
              <div style="color: #F8FAFC; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">
                Haut Conseil de la Communauté Scientifique Nationale à l'Étranger
              </div>
              <div style="color: #C8A951; font-size: 12px; margin-top: 4px; font-weight: 600;">
                Présidence de la République — Décret Présidentiel N° 26-293
              </div>
            </td>
          </tr>

          <!-- Notification Badge / Context -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${channelLabel || 'Messagerie Sécurisée'}
              </div>
              <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 14px 0 6px 0;">
                ${title}
              </h2>
            </td>
          </tr>

          <!-- Sender Details Card -->
          <tr>
            <td style="padding: 10px 30px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;">
                <tr>
                  <td>
                    <div style="font-size: 15px; font-weight: 700; color: #006233;">
                      ${senderName}
                    </div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">
                      <strong>${getRoleBadge(senderRole)}</strong> &bull; ${senderSpecialty || 'Membre du Conseil'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 10px 30px 24px 30px;">
              <div style="background-color: #ffffff; border-left: 4px solid #006233; padding: 16px 20px; margin: 8px 0; border-radius: 4px; background-color: #fafbfb; font-size: 15px; line-height: 1.6; color: #334155; font-style: normal;">
                "${messageContent.replace(/\n/g, '<br/>')}"
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 28px 30px; text-align: center;">
              <a href="${actionUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #006233 0%, #007A40 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 30px; box-shadow: 0 4px 12px rgba(0, 98, 51, 0.25); letter-spacing: 0.3px;">
                Accéder à la Messagerie Sécurisée &rarr;
              </a>
            </td>
          </tr>

          <!-- Security Footer Notice -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">
                Espace Collaboratif Réservé aux Membres du Haut Conseil
              </p>
              <p style="margin: 0; font-size: 11px;">
                Ce message contient des informations confidentielles destinées exclusivement aux membres accrédités du Haut Conseil. Si vous recevez cette alerte par erreur, veuillez en informer le secrétariat technique.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send private message email notification
 */
export async function notifyPrivateMessage({ recipientId, sender, content }) {
  try {
    const recipient = await prisma.user.findUnique({
      where: { id: parseInt(recipientId) },
      select: { id: true, email: true, nom: true, prenom: true },
    });

    if (!recipient || !recipient.email) return;

    const actionUrl = `${BASE_URL}/dashboard/chat?contactId=${sender.id}`;
    const subject = `[HCCSNE] Nouveau message de ${sender.prenom} ${sender.nom}`;
    const html = buildEmailHtml({
      title: `Nouveau message privé de ${sender.prenom} ${sender.nom}`,
      senderName: `${sender.prenom} ${sender.nom}`,
      senderRole: sender.role,
      senderSpecialty: sender.specialite,
      messageContent: content,
      channelLabel: 'Message Privé Direct',
      actionUrl,
    });

    await sendEmail({
      to: recipient.email,
      subject,
      html,
      text: `${sender.prenom} ${sender.nom} vous a envoyé un message sur le portail HCCSNE:\n\n"${content}"\n\nConsultez le portail: ${actionUrl}`,
    });
  } catch (error) {
    console.error('Error in notifyPrivateMessage:', error);
  }
}

/**
 * Send broadcast / general assembly email notification (from Admin or Coordinator)
 */
export async function notifyGeneralBroadcast({ sender, content }) {
  try {
    const allMembers = await prisma.user.findMany({
      where: {
        active: true,
        id: { not: sender.id },
      },
      select: { id: true, email: true, nom: true, prenom: true },
    });

    const actionUrl = `${BASE_URL}/dashboard/chat?roomId=1`;
    const subject = `[HCCSNE] Communication Officielle — ${sender.prenom} ${sender.nom}`;
    const html = buildEmailHtml({
      title: `Communication Officielle à l'Assemblée Générale`,
      senderName: `${sender.prenom} ${sender.nom}`,
      senderRole: sender.role,
      senderSpecialty: sender.specialite,
      messageContent: content,
      channelLabel: '📢 Assemblée Générale (Tous les Membres)',
      actionUrl,
    });

    for (const member of allMembers) {
      if (member.email) {
        sendEmail({
          to: member.email,
          subject,
          html,
          text: `Communication officielle de ${sender.prenom} ${sender.nom} à tous les membres:\n\n"${content}"\n\nConsultez le portail: ${actionUrl}`,
        }).catch(err => console.error(`Failed to send to ${member.email}:`, err));
      }
    }
  } catch (error) {
    console.error('Error in notifyGeneralBroadcast:', error);
  }
}

/**
 * Send specialty commission email notification to all members of the commission
 */
export async function notifySpecialtyCommission({ roomId, roomName, sender, content }) {
  try {
    const commissionMembers = await prisma.roomMember.findMany({
      where: {
        roomId: parseInt(roomId),
        userId: { not: sender.id },
      },
      include: {
        user: { select: { id: true, email: true, nom: true, prenom: true, active: true } },
      },
    });

    const actionUrl = `${BASE_URL}/dashboard/chat?roomId=${roomId}`;
    const subject = `[HCCSNE] Nouveau message — ${roomName}`;
    const html = buildEmailHtml({
      title: `Nouveau message dans la commission ${roomName}`,
      senderName: `${sender.prenom} ${sender.nom}`,
      senderRole: sender.role,
      senderSpecialty: sender.specialite,
      messageContent: content,
      channelLabel: `🏛️ Commission de Spécialité : ${roomName}`,
      actionUrl,
    });

    for (const item of commissionMembers) {
      if (item.user && item.user.active && item.user.email) {
        sendEmail({
          to: item.user.email,
          subject,
          html,
          text: `Message de ${sender.prenom} ${sender.nom} dans la commission ${roomName}:\n\n"${content}"\n\nConsultez le portail: ${actionUrl}`,
        }).catch(err => console.error(`Failed to send to ${item.user.email}:`, err));
      }
    }
  } catch (error) {
    console.error('Error in notifySpecialtyCommission:', error);
  }
}
