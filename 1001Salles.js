const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csv = require('json2csv').Parser;

const url ='https://www.1001salles.com/recherche?form-search-page=1&form-search-type-event-id=1&form-search-location-id=75&form-search-location-type=3&form-search-type-provider-id=148&form-search-distance=0&form-search-pax=&form-search-room=0&form-search-room-at=0&form-search-has-promotion=false&form-search-is-new=false&form-search-configuration=&form-search-id-service-caterer=';

let infos = [];

(async () =>{

    const browser = await puppeteer.launch({headless: false}); //{headless: false}
    const site = await browser.newPage()
    await site.setViewport({
        width: 1200,
        height: 800
    });
    await site.goto(url, {waitUntil: "networkidle2" });
    await site.waitForSelector('body > .cc-window > .cc-compliance > .cc-btn');
    await site.click('body > .cc-window > .cc-compliance > .cc-btn');
    await autoScroll(site);
    let i = 0;
    while (i < 62)
    {
        
        i++;
        //manual click      
        console.log('manual click n°:'+i+"/"+62);
        await site.waitForTimeout(6000);
        const page = await getActivePage(browser, 2000);
        let link = page.url();

        //get Name
        let  nameElement = await page.$('.provider-single > .container > .row > .single > .name');
        let name = await page.evaluate(el => el.innerText, nameElement);

        //get Address
        let  addressElement = await page.$('.provider-single > .container > .row > .single > .location');
        let address = 'n/a';
        if(addressElement != null) address = await page.evaluate(el => el.innerText, addressElement);

        //get Region 
        let  regionElement = await page.$('.container > .row > .single > .text-black-50 > .text-black-50:nth-child(4)');
        let region = 'n/a';
        if(regionElement != null) region = await page.evaluate(el => el.innerText, regionElement);


        //get phone_1 
        let  phoneElement_1 = await page.$('.col-md-6 > .select-simulated > .content > .color-primary:nth-child(2) > a');
        let phone_1 = 'n/a';
        if(phoneElement_1 != null) phone_1 = await page.evaluate(el => el.innerText, phoneElement_1);

        //get phone_2 
        let  phoneElement_2 = await page.$('.col-md-6 > .select-simulated > .content > .color-primary:nth-child(5) > a');
        let phone_2 = 'n/a';
        if(phoneElement_2 != null) phone_2 = await page.evaluate(el => el.innerText, phoneElement_2);

        //get Contact 
        let  contactElement = await page.$('.col-md-6 > .select-simulated > .content > .color-primary:nth-child(4)');
        let contact = 'n/a';
        if(contactElement != null) phone = await page.evaluate(el => el.innerText, contactElement);

        await infos.push({
            'Name': name,
            'Country': 'France',
            'Region': region,
            'Address': address,
            'Sector': 'n/a',
            'Mail' : 'n/a',
            'Main Phone': phone_1.replace('+',''),
            'Secondary Phone': phone_2.replace('+',''),
            'Contact name': contact,
            'WebSite': 'n/a',
            'Link': link
        });
        await page.close();
    }

    await browser.close();
    await browser.close();
    const j2csv = await new Json2csv(['Name','Country','Region','Address','Sector', 'Mail','Main Phone','Secondary Phone','Contact name','Link']);
    const csv = await j2csv.parse(infos);
    //console.log(csv);
    await fs.writeFileSync('csv/1001SallesParis.csv',csv, 'ascii')
    console.log('done !');

})();

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                
                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    console.log('scroll done !');
}

async function getActivePage(browser, timeout) {
    var start = new Date().getTime();
    while(new Date().getTime() - start < timeout) {
        var pages = await browser.pages();
        var arr = [];
        for (const p of pages) {
            if(await p.evaluate(() => { return document.visibilityState == 'visible' })) {
                arr.push(p);
            }
        }
        if(arr.length == 1) return arr[0];
    }
    throw "Unable to get active page";
}