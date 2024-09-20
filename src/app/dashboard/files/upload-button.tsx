"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  useOrganization, 
  useUser
} from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(2).max(99),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
})

export function UploadButton() {
  const { toast } = useToast()
  const organization = useOrganization()
  const user = useUser()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined
    },
  })

  const fileRef = form.register("file")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!orgId) return

    const postUrl = await generateUploadUrl()
    const fileType = values.file[0].type
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": fileType },
      body: values.file[0],
    })
    const { storageId } = await result.json()

    console.log(fileType)
    const types = {
      "image/png": "image",
      "image/svg+xml": "image",
      "image/jpeg": "image",
      "image/gif": "image",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
      "application/pdf": "pdf",
      "application/x-zip-compressed": "zip",
      "text/csv": "csv",
      "text/plain": "txt",
      "audio/mpeg": "audio",
      "video/mp4": "video"
    } as Record<string, Doc<"files">["type"]>
    
    try{
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
        type: types[fileType]
      })

      form.reset()
      setIsFileDialogOpen(false)
  
      toast({
        variant: "success",
        title: "File upload!",
        description: "Success upload"
      })

    } catch (error){

      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be uploaded, try again later"
      })

    }
  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded){
    orgId = organization.organization?.id ?? user.user?.id
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

  const createFile = useMutation(api.files.createFile)

  return (
        <Dialog open={isFileDialogOpen} onOpenChange={(isOpen) => {
          setIsFileDialogOpen(isOpen)
          form.reset()
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              
              }}>
                Upload File
            </Button>
            </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="mb-4">Upload your File</DialogTitle>
                  <DialogDescription>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="file"
                            render={() => (
                              <FormItem>
                                <FormLabel>File</FormLabel>
                                <FormControl>
                                  <Input type="file" {...fileRef}/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={form.formState.isSubmitting} className="flex gap-2">
                            {form.formState.isSubmitting && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                            Submit
                          </Button>
                        </form>
                      </Form>
                  </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
  )
}