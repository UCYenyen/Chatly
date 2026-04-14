import React from 'react'
import { Card } from '@/components/ui/card'
import { CardTitle, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TriangleAlert } from 'lucide-react'
import Link from 'next/link'
export default function page() {
    return (
        <section className='py-32 pt-48 w-screen overflow-hidden flex justify-center items-center'>
            <Card className='w-112.5 max-w-[80%] min-h-72 flex flex-col justify-between shadow-lg'>
                <CardHeader>
                    <div className='flex justify-center items-center gap-4'>
                        <CardTitle className='text-2xl'>Tidak Memiliki Akses</CardTitle>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent>
                    <CardDescription className='text-center flex flex-col gap-4 items-center justify-center'>
                        <div className='p-4 flex justify-center items-center bg-gray-200 rounded-full'>
                            <TriangleAlert className="w-12 h-12 text-black" />
                        </div>
                        <p className='my-4 text-center w-[90%]'>Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda percaya ini adalah kesalahan.</p>
                    </CardDescription>
                </CardContent>
                <CardFooter className='flex justify-center items-center'>
                    <Link href='/' className='bg-primary text-accent px-4 py-2 rounded hover:bg-primary/90 transition'>
                        Kembali ke Beranda
                    </Link>
                </CardFooter>
            </Card>
        </section>
    )
}
