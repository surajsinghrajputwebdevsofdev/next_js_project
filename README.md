import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/router";
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
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { formSchema } from "@/lib/schema";
import Logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

const SignIn = () => {
  const [verifyCaptcha, setVerifyCaptcha] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/login", values);

      if (response.data && response.data.verified) {
        alert("Login successful!");
        // Store token and redirect or perform any other actions
        localStorage.setItem("token", response.data.token);
        router.push("/dashboard");
      } else {
        alert("Login failed: User is not verified.");
      }
    } catch (error) {
      alert("An error occurred during login.");
      console.error(error);
    }
  };

  const onChange = (value: any) => {
    setVerifyCaptcha(!!value);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-84px)] justify-center items-center dark:text-white">
      {!submit ? (
        <Card className="max-w-lg w-full min-h-[400px] shadow-md relative p-4">
          <CardHeader>
            <CardTitle className="text-center text-4xl text-primary font-signika">
              Login to LabTrack
            </CardTitle>
            <CardDescription className="text-center text-md text-slate-600 dark:text-white">
              Find out the LabTrack URL for your company
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter Email"
                          className="py-6"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter Password"
                          className="py-6"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="place-content-end flex items-center gap-4 justify-between">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY!}
                  onChange={onChange}
                />
                <Button
                  disabled={!verifyCaptcha || !form.getValues("email")}
                  className="p-6 w-32"
                  type="submit"
                >
                  Login
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <Card className="max-w-lg w-full min-h-[400px] shadow-md relative p-4">
          <CardHeader>
            <CardTitle className="text-center text-4xl text-primary font-signika">
              Login to LabTrack
            </CardTitle>
            <CardDescription className="text-center text-md text-slate-600 dark:text-white">
              Search results for: {form.getValues("email")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 place-content-center">
            <Link href={"http://cssoftsolution.localhost:3000/auth/sign-in"}>
              <div className="max-w-sm w-full m-auto h-[100px] rounded-md bg-gray-100 flex items-center justify-between px-10">
                <Image
                  alt="Ideation Ink Logo"
                  className="text-lg"
                  width={60}
                  height={60}
                  src={Logo.src}
                  style={{
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p className="text-lg"> CS Soft Solutions (I) Pvt Ltd</p>
                  <p className="text-primary underline">
                    cssoftsolution.greythr.com
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
          <CardFooter className="place-content-center flex items-center justify-center">
            <Button className="p-6" type="submit">
              Find Another Domain
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SignIn;




import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import RegisterModel from "../../models/register";

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password } = req.body;
    const user = await RegisterModel.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(404).json({ message: "Wrong email/password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "User is not verified" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY!);
    return res.status(200).json({ token, message: "User login successfully" });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export default login;


npm install react-toastify



import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/router";
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
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { formSchema } from "@/lib/schema";
import Logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignIn = () => {
  const [verifyCaptcha, setVerifyCaptcha] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/login", values);

      if (response.data && response.data.verified) {
        toast.success("Login successful!");
        // Store token and set state
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setSubmit(true);
      } else {
        toast.error("User is not verified.");
      }
    } catch (error) {
      toast.error("An error occurred during login.");
      console.error(error);
    }
  };

  const onChange = (value: any) => {
    setVerifyCaptcha(!!value);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-84px)] justify-center items-center dark:text-white">
      <ToastContainer />
      {!submit ? (
        <Card className="max-w-lg w-full min-h-[400px] shadow-md relative p-4">
          <CardHeader>
            <CardTitle className="text-center text-4xl text-primary font-signika">
              Login to LabTrack
            </CardTitle>
            <CardDescription className="text-center text-md text-slate-600 dark:text-white">
              Find out the LabTrack URL for your company
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter Email"
                          className="py-6"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-md">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter Password"
                          className="py-6"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="place-content-end flex items-center gap-4 justify-between">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY!}
                  onChange={onChange}
                />
                <Button
                  disabled={!verifyCaptcha || !form.getValues("email")}
                  className="p-6 w-32"
                  type="submit"
                >
                  Login
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <Card className="max-w-lg w-full min-h-[400px] shadow-md relative p-4">
          <CardHeader>
            <CardTitle className="text-center text-4xl text-primary font-signika">
              Login to LabTrack
            </CardTitle>
            <CardDescription className="text-center text-md text-slate-600 dark:text-white">
              Search results for: {form.getValues("email")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 place-content-center">
            <Link href={`http://cssoftsolution.localhost:3000/auth/sign-in?token=${token}`}>
              <div className="max-w-sm w-full m-auto h-[100px] rounded-md bg-gray-100 flex items-center justify-between px-10">
                <Image
                  alt="Ideation Ink Logo"
                  className="text-lg"
                  width={60}
                  height={60}
                  src={Logo.src}
                  style={{
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p className="text-lg"> CS Soft Solutions (I) Pvt Ltd</p>
                  <p className="text-primary underline">
                    cssoftsolution.greythr.com
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
          <CardFooter className="place-content-center flex items-center justify-center">
            <Button className="p-6" onClick={() => setSubmit(false)}>
              Find Another Domain
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SignIn;


