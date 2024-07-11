"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formSchema } from "@/lib/schema";
import Logo from "@/public/logo.png";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SignIn = () => {
  const [verifyCaptcha, setVerifyCaptcha] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrPhone: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values) {
      setSubmit(true);
    }
  }

  function onChange(value: any) {
    if (value) setVerifyCaptcha(!!value);
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-84px)] justify-center  items-center  dark:text-white ">
      {!submit ? (
        <Card className="max-w-lg  w-full  min-h-[400px] shadow-md relative p-4">
          <CardHeader>
            <CardTitle className=" text-center text-4xl text-primary font-signika ">
              Login to LabTrack
            </CardTitle>
            <CardDescription className=" text-center text-md text-slate-600 dark:text-white">
              Find out the LabTrack URL for your company
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className=" space-y-2">
                <FormField
                  control={form.control}
                  name="emailOrPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md">
                        Official Email or Phone Number
                      </FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter Email/Phone No."
                          className=" py-6"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className=" place-content-end flex items-center gap-4  justify-between ">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY!}
                  onChange={onChange}
                />
                <Button
                  disabled={verifyCaptcha || !!form.getValues("emailOrPhone")}
                  className="p-6 w-32"
                  type="submit"
                >
                  Search
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <Card className="max-w-lg  w-full  min-h-[400px] shadow-md relative p-4">
          <CardHeader>
            <CardTitle className=" text-center text-4xl text-primary font-signika ">
              Login to LabTrack
            </CardTitle>
            <CardDescription className=" text-center text-md text-slate-600 dark:text-white">
              Search results for: {form.getValues("emailOrPhone")}
            </CardDescription>
          </CardHeader>
          <CardContent className=" space-y-2 place-content-center">
            <Link href={"http://cssoftsolution.localhost:3000/auth/sign-in"}>
              <div className=" max-w-sm w-full m-auto h-[100px] rounded-md bg-gray-100 flex items-center justify-between px-10">
                <Image
                  alt="Ideation Ink Logo"
                  className=" text-lg"
                  width={60}
                  height={60}
                  src={Logo.src}
                  style={{
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p className=" text-lg"> CS Soft Solutions (I) Pvt Ltd</p>
                  <p className=" text-primary underline">
                    cssoftsolution.greythr.com
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
          <CardFooter className=" place-content-center flex items-center justify-center ">
            <Button className="p-6 " type="submit">
              Find Another Domain
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SignIn;
