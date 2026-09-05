import fs from 'fs';

async function upload() {
  const fileContent = fs.readFileSync('package.json');
  const blob = new Blob([fileContent], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob, 'package.json');
  
  const res = await fetch('http://localhost:5174/api/icons', {
    method: 'POST',
    body: formData
  });
  console.log(res.status, await res.text());
}
upload();
