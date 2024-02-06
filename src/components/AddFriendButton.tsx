"use client"

//? este form es muy basico (1 input noma) pero esta bastante bien manejado

import { FC, useState } from "react";
import axios, { AxiosError } from "axios";
import { z } from 'zod';


import Button from "@/components/ui/Button";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = () => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false)


  const {
    register,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(addFriendValidator),
    defaultValues: {
      email: '',
    },
  })

  const addFriend = async (email:string) => {
    try {
      const validatedEmail = addFriendValidator.parse({email});

      await axios.post('/api/friends/add', {
        email: validatedEmail,
      })

      setShowSuccessState(true);
    } catch (error) {
      if(error instanceof z.ZodError ){
        setError('email', {message: error.message})
        return;
      }
      if(error instanceof AxiosError ){
        console.log(error)
        setError('email', {message: error.response?.data})
        return;
      }

      setError('email', {message: 'Something went wrong.'})
    }
  };

  const onSubmit = (data:FormData) => {
    addFriend(data.email)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <label 
        htmlFor="email" 
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>
      <div className="mt-2 flex gap-4">
        <input
          type='text'
          className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
          placeholder='you@example.com'
          {...register('email')}
        />
        <Button type="submit">Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      {showSuccessState 
        ? <p className="mt-1 text-sm text-green-600">Friend request sent!</p>
        : null
      }
    </form>
  );
}
 
export default AddFriendButton;