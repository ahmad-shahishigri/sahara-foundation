"use client";

import { useRouter } from "next/navigation";//import Doner from "../Doner/DonerForms"
export default function Test()
{
   const cssVariables = {
  '--primary-color': '#007bff',
  '--secondary-color': '#7d6c6cff',
  '--padding-md': '16px',
  '--border-radius': '8px',
  '--color':'red'
} as React.CSSProperties;
    const router=useRouter()
    return(
        <>
        <style>{`
           .btn{
           color:red;
           } 
       `}
        </style>
      <p style={cssVariables}>

<button  onClick={() => router.push("/Doner")} style={{
    backgroundColor:'var(--secondry-color)'
}}>
        + Add Donor
      </button>
        <p style={{backgroundColor:' var(--color)'}}>this is paragraph</p>
         </p>
    </>)
}