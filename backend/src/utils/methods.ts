/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import puppeteer from 'puppeteer';

const createEdgeNGrams = (str: string) =>
  /*   if (str && str.length > 2) {
    const minGram = 2;
    const maxGram = str.length;

    return str
      .split(' ')
      .reduce((ngrams: string[], token: string) => {
        if (token.length > minGram) {
          for (let i = minGram; i <= maxGram && i <= token.length; ++i) {
            ngrams = [...ngrams, token.substring(0, i)];
          }
        } else {
          ngrams = [...ngrams, token];
        }
        return ngrams;
      }, [])
      .join(' ');
  } */

  str;

const readCSV = async (filePath: string) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');

    const rows = data.replace(/\r/g, '').split('\n');

    const parsedRows = rows.map((row) => {
      let buffer = '';
      let inQuote = false;
      const fields = [];
      Array.from(row).forEach((char) => {
        if (char === '"') {
          inQuote = !inQuote;
        }

        if (char === ',' && !inQuote) {
          fields.push(buffer.trim());
          buffer = '';
        } else {
          buffer += char;
        }
      });

      fields.push(buffer.trim());
      return fields;
    });

    return parsedRows;
  } catch (error) {
    console.error(`Error reading file from path ${filePath}`, error);
    throw error;
  }
};

const generateHandle = (title: string): string => {
  const latinToEnglishMap: { [key: string]: string } = {
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ü: 'u',
    ñ: 'n',
    ç: 'c',
    ß: 'ss',
    ÿ: 'y',
    œ: 'oe',
    æ: 'ae',
  };

  const normalizedTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const handle = normalizedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\x7F]/g, (char) => latinToEnglishMap[char] || '');

  return handle;
};
const callWithRetry = async (
  func: () => Promise<any>,
  retries: number = 3,
  delay: number = 1000
): Promise<any> => {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      return await func();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};
const safeSum = (...numbers: (number | string)[]): number => {
  const sum = numbers.reduce((acc: number, num: number | string) => {
    if (typeof num !== 'number') {
      // eslint-disable-next-line no-param-reassign
      num = Number(num);
    }

    if (Number.isNaN(num)) {
      throw new Error(
        'Invalid input: One or more inputs cannot be converted to a number.'
      );
    }

    return acc + num;
  }, 0);

  return parseFloat(sum.toFixed(2));
};
const safeSubtract = (...numbers: (number | string)[]): number => {
  if (numbers.length === 0) {
    throw new Error('No numbers provided for subtraction.');
  }

  let firstNumber: number | string = numbers[0];

  if (typeof firstNumber !== 'number') {
    firstNumber = Number(firstNumber);
  }

  if (Number.isNaN(firstNumber)) {
    throw new Error(
      'Invalid input: The first input cannot be converted to a number.'
    );
  }

  const result = numbers
    .slice(1)
    .reduce((acc: number, num: number | string) => {
      if (typeof num !== 'number') {
        // eslint-disable-next-line no-param-reassign
        num = Number(num);
      }

      if (Number.isNaN(num)) {
        throw new Error(
          'Invalid input: One or more inputs cannot be converted to a number.'
        );
      }

      return acc - num;
    }, firstNumber);

  return parseFloat(result.toFixed(2));
};
// // Function to check if a field is allowed to be updated
const isFieldAllowed = (field: string, allowedFields: string[]) => {
  const fieldParts = field.split('.');
  if (fieldParts.length > 1) {
    return allowedFields.includes(`${fieldParts[0]}.${fieldParts[1]}`);
  }
  return allowedFields.includes(field);
};

const mergeAndUpdateChanges = (
  field: string,
  updateObj: any,
  offer: any,
  changes: any
) => {
  const [parentField, subField] = field.split('.');
  const updateObjCopy = { ...updateObj };
  const changesCopy = { ...changes };

  if (parentField in offer) {
    // Merge the new subfield with the existing subobject
    updateObjCopy[parentField] = {
      ...offer[parentField], // existing subobject
      [subField]: updateObjCopy[field], // new subfield
    };

    // Add the merged subobject to changesCopy
    changesCopy[parentField] = updateObjCopy[parentField];
    delete updateObjCopy[field];
  }

  return { updateObjCopy, changesCopy };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generatePdfFinalOffer = async (/* add whatever */) => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF</title>
</head>

<style>
    * {
        margin: 0;
    }

    html {
        font-family: Arial, Helvetica, sans-serif;
    }

    main {
        padding: 1rem 3rem;
    }

   
</style>

<body>
    <main>
    </main>
</body>
</html>

  `;

  await page.setContent(content);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '40px',
      bottom: '50px',
    },
  });

  await browser.close();
  return pdfBuffer;
};

const createHtmlTemplate = (
  name: string,
  content: string,
  subject = 'Updates from HONPE PORTAL'
) => {
  const transformUrlsToButtons = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) => `
      <a href="${url}" style="display: inline-block; margin: 5px; padding: 10px 20px; background-color: #18709f; color: white; text-decoration: none; border-radius: 5px;">Click</a>
      <p>If the button doesn't work, you can also <a href="${url}" style="color: #18709f; text-decoration: underline;">click here</a> or copy the following link: ${url}</p>
    `
    );
  };

  const transformedContent = transformUrlsToButtons(content);
  return `
  <!DOCTYPE html>
<html>
<head>
  <title>New Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      border: 1px solid #ccc;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #18709f;
      color: white;
      text-align: center;
      padding: 10px;
    }
    .content {
      padding: 20px;
    }
    .footer {
      background-color: #f2f2f2;
      padding: 10px;
      text-align: center;
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <h2>${subject}</h2>
  </div>
  <div class="content">
    <p>Dear ${name},</p>
    <p>${transformedContent}</p>
  </div>
  <div class="footer">
    <p>Best regards,</p>
    <p>Team</p>
  </div>
</div>

</body>
</html>
`;
};
const generateCSV = (/* whhatever  */) => {
  let csvContent = 'Id\n';

  csvContent += '\n';

  return csvContent;
};

export {
  createEdgeNGrams,
  readCSV,
  generateHandle,
  callWithRetry,
  isFieldAllowed,
  mergeAndUpdateChanges,
  generatePdfFinalOffer,
  safeSum,
  createHtmlTemplate,
  generateCSV,
  safeSubtract,
};
