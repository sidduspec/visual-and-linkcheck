(async function testDrupalSpamProtections() {
    const formUrl = 'https://www.hamiltoncounty.com/form/boe-contact-form';// Replace with actual form URL
    const honeypotFieldName = 'url'// Replace with actual honeypot field name
    const csrfToken = ''; // Optional: Set token if required
  
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'X-CSRF-Token': csrfToken // Optional, if CSRF token is required
    };
  
    const params = new URLSearchParams({
      name: 'Bot Tester',
      email: 'bot@fakeemail.com',
      subject: 'Spam Test',
      message: 'Spam content incoming!',
      [honeypotFieldName]: 'I am a bot!', // Honeypot trap
      'g-recaptcha-response': '' // Empty CAPTCHA response
    });
  
    try {
      const response = await fetch(formUrl, {
        method: 'POST',
        headers,
        body: params.toString()
      });
  
      const html = await response.text();
  
      console.log('Status:', response.status);
      console.log('Response snippet:', html.slice(0, 1000))//g first 200 characters of the response
  
      if (html.includes('CAPTCHA response is missing')) {
        console.warn('❌ CAPTCHA blocked submission.');
      } else if (html.includes('too quickly')) {
        console.warn('❌ Honeypot or time-trap blocked submission.');
      } else if (response.status === 403) {
        console.warn('❌ Possibly blocked by Antibot (non-JS).');
      } else {
        console.log('✅ Form accepted the bot-like submission! (Check this behavior)');
      }
  
    } catch (err) {
      console.error('⚠️ Request failed:', err);
    }
  })();
  