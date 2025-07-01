import { useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation'; 

export default function JoinRoom({ user_id }: { user_id: string }) {
    const [code, setCode] = useState('');
    const router = useRouter()

    const onJoinRoom = async () => {
        console.log('Attempting to join room with:', { user_id, code });

        if (!code) {
            alert('please enter a room code.');
            return;
        }

        try {
            const result = await fetch(`/api/rooms/join?user_id=${user_id}&code=${code}`, {
                method: 'POST',
            });

            const data = await result.json()

            if (result.ok) {
                router.push(`/play/${data.room_id}`)
            } else {
                const errorData = await result.json();
                alert(`something went really bad! ${errorData.error}`)
            }
        } catch (e) {
            console.error('error during fetch:', e);
            alert('an unexpected error occurred.');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="w-full h-12 px-6 py-2 rounded-lg bg-white text-black border border-gray-300 font-semibold shadow hover:bg-gray-100 flex items-center justify-center cursor-pointer text-base gap-2 group"
                >
                    <KeyRound className="w-6 h-6 text-[#611f69] group-hover:scale-110 transition-transform" />
                    Join room
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join a room</DialogTitle>
                    <DialogDescription>Enter the code for the room.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button className='bg-[#611f69] hover:bg-[#611f69]/70' onClick={onJoinRoom}>Join</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}