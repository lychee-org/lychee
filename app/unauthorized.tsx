import SignInWithLichessButton from '@/components/auth/sign-in-with-lichess-button';

export default function Unauthorized() {
  return (
    <div className='flex h-[calc(100svh-3.5rem)] w-full flex-col gap-7 p-3 md:gap-2 md:pb-8'>
      <div className='m-auto flex h-full w-full max-w-[min(28rem,99.9%)] flex-auto grow items-center text-balance text-[clamp(3rem,8svh,6rem);] font-extrabold leading-none md:max-w-[min(70rem,90%)] md:text-center md:text-[clamp(5rem,10vw,6rem);]'>
        Improve your chess skills with Lychee_
      </div>
      <div className=' flex flex-col items-center justify-center gap-4 md:mx-auto md:flex-row md:gap-2 md:px-12'>
        <div className='m-auto h-auto w-full px-1'>
          <SignInWithLichessButton />
        </div>
      </div>
    </div>
  );
}
