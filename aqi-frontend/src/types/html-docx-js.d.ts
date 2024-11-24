declare module 'html-docx-js/dist/html-docx' {
  const htmlDocx: {
    asBlob: (html: string) => Blob;
    asArrayBuffer: (html: string) => ArrayBuffer;
  };
  export default htmlDocx;
}
