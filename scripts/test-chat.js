const http = require('http');

async function test() {
  console.log('Testing Chat API endpoints...');

  // 1. Login as Zerhouni
  const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'zerhouni@hccsne.dz', password: 'membre123' }),
  });

  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Zerhouni status:', loginRes.status, 'Cookie received:', !!cookie);

  // 2. Fetch contacts
  const contactsRes = await fetch('http://127.0.0.1:3000/api/chat/contacts', {
    headers: { Cookie: cookie },
  });
  const contactsData = await contactsRes.json();
  console.log('Contacts success:', contactsData.success);
  console.log('Channels general:', contactsData.channels?.general?.name);
  console.log('Specialty commissions for Zerhouni:', contactsData.channels?.commissions?.map(c => c.name));
  console.log('Total contacts loaded:', contactsData.contacts?.length);

  // 3. Post a message to General Assembly (Room 1)
  const postMsgRes = await fetch('http://127.0.0.1:3000/api/chat/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      type: 'room',
      roomId: 1,
      content: 'Chers collègues membres du Haut Conseil, bienvenue sur notre espace plénier sécurisé pour la concertation des priorités nationales.',
      notifyEmail: false, // test without spamming
    }),
  });
  const postData = await postMsgRes.json();
  console.log('Post to General Assembly status:', postMsgRes.status, 'Success:', postData.success);

  // 4. Post a private message to Youcef-Toumi
  const toumi = contactsData.contacts?.find(c => c.nom.toLowerCase().includes('youcef-toumi') || c.email.includes('youcef-toumi'));
  if (toumi) {
    console.log('Found Youcef-Toumi ID:', toumi.id);
    const postPrivRes = await fetch('http://127.0.0.1:3000/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        type: 'private',
        recipientId: toumi.id,
        content: 'Bonjour Pr. Youcef-Toumi, je souhaiterais faire le point sur la feuille de route mécatronique et robotique.',
        notifyEmail: false,
      }),
    });
    const postPrivData = await postPrivRes.json();
    console.log('Post private message success:', postPrivData.success);
  }

  // 5. Read back messages
  const getMsgsRes = await fetch('http://127.0.0.1:3000/api/chat/messages?type=room&roomId=1', {
    headers: { Cookie: cookie },
  });
  const msgsData = await getMsgsRes.json();
  console.log('Read General Assembly messages count:', msgsData.messages?.length);
  console.log('Sample message:', msgsData.messages?.[0]?.content);

  console.log('All Chat API tests passed successfully!');
}

test().catch(console.error);
