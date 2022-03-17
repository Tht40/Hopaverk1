import cloudinary from 'cloudinary';
import { updateMenuItemImage } from './db.js';

cloudinary.config({
  cloud_name: 'dil4cpy2p',
  api_key: '289144395245643',
  api_secret: '86rgKE58BR9N4IsZ6vXZ8fUB4nk',
});

export async function uploadFileBuffer(itemId, fileBuffer) {
  cloudinary.uploader.upload_stream((result) => {
    console.log(result.secure_url);
    updateMenuItemImage(itemId, result.secure_url);
  }).end(fileBuffer);
}

// cloudinary.v2.uploader.upload("https://www.pngitem.com/pimgs/m/186-1866460_pineapple-pizza-osrs-hd-png-download.png",
//   { public_id: "pinapple_pizza" },
//   function (error, result) { console.log(result); });

