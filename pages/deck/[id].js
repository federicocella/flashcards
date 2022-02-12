import Viewer from '@/components/Viewer';
import LoadingDots from '@/components/ui/LoadingDots';
import { useRouter } from 'next/router';
import { useUser } from '@/utils/useUser';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase-client';
import Button from '@/components/ui/Button';
import Link from 'next/link';


export default function DeckPage() {

    const { userLoaded, user, session, userDetails } = useUser();
    const [deck, setDeck] = useState(null);
    const [paths, setPaths] = useState([])
    const [loading, setLoading] = useState(false)
    const [debug, setDebug] = useState(false)
    const [shadows, setShadows] = useState(false)
    const [mode, setMode] = useState('autoplay')
    const [copied, setCopied] = useState(false)
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        if (!user) {
            // If no user, redirect to index.
            console.error('no user logged in')
            if (!user) router.replace('/');
        } else {
            getDeck()
        }
    }, [user])

    async function getDeck() {
        setLoading(true);
        console.log('getting deck', id)
        let { data, error, status } = await supabase.from('flashcards').select('id, deck_id, front, back').match({ deck_id: id })
        console.log('got deck', data)
        if (Array.isArray(data)) {
            console.log('received an array', data)
            data = data[0]
        }
        console.log('data', data)
        if (error) console.error('error', error.message)
        if (data && !error) {
            setMode(data.mode)
            setDeck(data)
            getPublicUrl(data)
        }
        setLoading(false);
    }

    async function getPublicUrl(proj) {

    }

    async function saveDeck() {
        setLoading(true);
        const { data, error } = await supabase.from('decks').update({
            name: deck.name,
            pictures: deck.pictures,
            mode: mode
        }).match({ id: id })
        setLoading(false);
    }

    async function deleteDeck() {
        if (confirm('Are you sure you want to delete the deck?')) { alert('Deck deleted') } else { return }
        const toRemove = deck.pictures
        const { data, error } = await supabase.storage.from('avatars').remove(toRemove)
        if (!error) {
            const { data, error } = await supabase.from('decks').delete().match({ id: id })
        }
        router.push('/dashboard')
    }

    const iframeCode = `<iframe width="500" height="500" src="${process.env.NEXT_PUBLIC_ROOT_URL}/embed/${id}" style="border: none;"></iframe>`

    return (
        <div>
            {loading ? <div className='w-16 pt-16 mx-auto'><LoadingDots /></div> :
                <div>
                    <div className='fixed flex items-center top-0 w-full text-md px-4 pl-8 h-16 bg-white border-b border-gray-200 font-bold'>
                        <Link href="/">
                            <a className="text-xl font-extrabold text-accents-0" aria-label="Logo">
                                Flashcards
                            </a>
                        </Link>
                        <div className="ml-8 flex-grow ">{deck ? deck.name : ''}</div>
                        <div className="mr-2"><Button variant="slim" className='text-lefttext-accents-0' onClick={() => saveDeck()}>Update</Button></div>
                    </div>
                    <div className='flex h-screen'>
                        <div className='flex-grow flex items-center'>{deck ? deck.front
                            : 'This product doesn\'t contain any images'}
                        </div>
                    </div>
                </div>
            }
        </div >
    )
}