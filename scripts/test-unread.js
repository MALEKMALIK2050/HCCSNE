async function testYoucefToumi() {
  console.log('Testing Youcef-Toumi view...');
  const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'youcef-toumi@hccsne.dz', password: 'membre123' }),
  });
  const cookie = loginRes.headers.get('set-cookie');

  // Fetch contacts to check unread count from Zerhouni
  const contactsRes = await fetch('http://127.0.0.1:3000/api/chat/contacts', {
    headers: { Cookie: cookie },
  });
  const contactsData = await contactsRes.json();
  const zerhouni = contactsData.contacts?.find(c => c.id === 2);
  console.log('Zerhouni unreadCount for Youcef-Toumi:', zerhouni?.unreadCount);

  // Read conversation with Zerhouni (should mark read)
  const readRes = await fetch('http://127.0.0.1:3000/api/chat/messages?type=private&contactId=2', {
    headers: { Cookie: cookie },
  });
  const readData = await readRes.json();
  console.log('Messages retrieved:', readData.messages?.length);
  console.log('Message content:', readData.messages?.[0]?.content);

  // Verify unread count is now 0
  const unreadRes = await fetch('http://127.0.0.1:3000/api/chat/unread-count', {
    headers: { Cookie: cookie },
  });
  const unreadData = await unreadRes.json();
  console.log('Total unread count for Youcef-Toumi after reading:', unreadData.unreadCount);
}

testYoucefToumi().catch(console.error);
