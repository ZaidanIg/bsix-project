import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
    
  documentUploader: f({ 
    pdf: { maxFileSize: "4MB" },
    image: { maxFileSize: "4MB" } 
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload complete:", file.url);
      return { url: file.url };
    }),
};
