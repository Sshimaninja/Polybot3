import { COMPARE } from './V2V2';
import fs from 'fs';

//Filter out undefined values 
export async function filter() {
    try {
        const dexdata = await COMPARE();
        const dexdatafilter = dexdata.filter((item: any) => ((item !== undefined /*&& Number(item.SUSHI.TVLUSD) > 100*/) && (item !== undefined)));
        //// Optionally sort by TVL or diffPercent or anything else
        // const dexdatasorted = dexdatafilter.sort((a: any, b: any) => {
        //     return b.diffPercent - a.diffPercent;
        // })
        // console.log(dexdatasorted)//DEBUG

        /////////////////////////////////////////////DEBUG
        fs.writeFile('./DATASAMPLEV2V2.yaml', JSON.stringify(dexdatafilter, null, 4), err => {
            if (err) {
                console.error(err);
            }
            // console.log('DATA SAMPLE UPDATED.')
        })
        /////////////////////////////////////////////DEBUG

        return (dexdatafilter);
    } catch (error) {
        console.log(error);
        return;
    };
}
filter()
