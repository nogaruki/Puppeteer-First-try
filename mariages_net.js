const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csv = require('json2csv').Parser;

const website = 'https://www.mariages.net';
let infos = [];
let i = 1;

(async () =>{

    const browser = await puppeteer.launch(); //{headless: false}
    const site = await browser.newPage()
    while(i < 19)
    {
        console.log("Page n°: "+i+"/19")
        let url ='https://www.mariages.net/busc.php?id_grupo=1&id_region=32&id_provincia=485&id_geozona=&id_poblacion=&id_sector=&distance=0&lat=48.8566665649&long=2.3509869576&showmode=thumb&NumPage=15'+ i;
        await site.goto(url, {waitUntil: "networkidle2" });
        // get body
        // let body = await page.evaluate(() => document.body.innerHTML);
        // console.log(body);

        //get links     
        const links = await site.$$eval('div.directory-img-item-top > a', as => as.map(a => a.href));
        let progress = 0;
        for(const link of links)
        {
            progress++;
            console.log(progress+'/'+links.length);
            const page = await browser.newPage();
            await page.goto(link);

            
            //get Name
            let nameElement = await page.$('div.wrapper > div > div >h1');
            let name = await page.evaluate(el => el.innerText, nameElement)
            //console.log(name);

            //get address
            let addressElement = await page.$('div.wrapper > div > div > div.storefrontHeaderOnepage__address');
            let address = await page.evaluate(el => el.innerText, addressElement)
            address = address.split(' Carte ·')[0]; 
            //console.log(address);

             //get country
            let region = (address.split('(')[1]).replace(')', '');
            // console.log(region);

            //get phone
            // await autoScroll(page);
            if(await page.$('button#onetrust-accept-btn-handler') != null) await page.click('button#onetrust-accept-btn-handler');
            if(await page.$('.storefrontHeader__infoContainer > .storefrontHeader__info > .storefrontHeaderOnepage__address > .app-emp-phone-wrapper > .app-emp-phone-txt') != null)
            {
                await page.click('.storefrontHeader__infoContainer > .storefrontHeader__info > .storefrontHeaderOnepage__address > .app-emp-phone-wrapper > .app-emp-phone-txt');
                await page.click('.storefrontHeader__infoContainer > .storefrontHeader__info > .storefrontHeaderOnepage__address > .app-emp-phone-wrapper > .app-emp-phone-txt');
            }
            await page.waitForTimeout(500);
            let phoneElement = await page.$('div.wrapper > div > div > div.storefrontHeaderOnepage__address > span > span#app-emp-phone > div >p.storefrontDrop__tag');
            let phone = 'n/a'; 
            if(phoneElement != null)
            {
                phone = await page.evaluate(el => el.innerText, phoneElement)
                phone = await phone.replace('\n', '').replace(' ', '').replace('&nbsp;', '');
            }
            console.log(phone); 
            //get sector
            let sector = await link.split('/')[3];
            // console.log(sector); 

            //Add in list 
            await infos.push({
                'Name': name,
                'Country': 'France',
                'Region': region,
                'Address': address,
                'Sector': sector,
                'Mail' : 'n/a',
                'Main Phone': phone.replace('+',''),
                'Secondary Phone': 'n/a',
                'Contact name': 'n/a',
                'WebSite': 'n/a',
                'Link': link
            })

            await page.close();

            
        }
        i++;
    }

    await browser.close();
    const j2csv = await new Json2csv(['Name','Country','Region','Address','Sector','Mail','Main Phone','Secondary Phone','Contact name','WebSite','Link']);
    const csv = await j2csv.parse(infos);
    //console.log(csv);
    await fs.writeFileSync('csv/mariage_netParis.csv',csv, 'ascii')
    console.log('done !');

})();