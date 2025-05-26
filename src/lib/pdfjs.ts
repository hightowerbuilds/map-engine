import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'

// Initialize PDF.js with matching version
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`

export { getDocument } 