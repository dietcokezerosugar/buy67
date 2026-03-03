

async function testBaseUPI() {
    console.log("Testing BaseUPI API...");
    try {
        const response = await fetch('https://baseupi.netlify.app/api/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'zp_live_caff7208',
                'Authorization': 'Bearer zp_live_caff72084d264b69c99efea9bb16110b2a6dffb44c0238e6'
            },
            body: JSON.stringify({
                merchant_order_id: `ord_${Date.now()}`,
                amount_paise: 100,
                line_items: [{ name: "Pro Plan", amount_paise: 100, quantity: 1 }]
            })
        });
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (e) {
        console.error(e);
    }
}

testBaseUPI();
