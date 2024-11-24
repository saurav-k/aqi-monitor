declare module 'html-docx-js/dist/html-docx' {
    interface HtmlDocxOptions {
      orientation?: 'portrait' | 'landscape';
    }
  
    const htmlDocx: {
      asBlob(html: string, options?: HtmlDocxOptions): Blob;
    };
  
    export default htmlDocx;
  }
  