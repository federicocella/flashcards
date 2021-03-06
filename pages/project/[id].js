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
    const [project, setDeck] = useState(null);
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
        console.log('getting project', id)
        let { data, error, status } = await supabase.from('flashcards').select('id, deck_id, front, back').match({ deck_id: id })
        console.log('got project', data)
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
            name: project.name,
            pictures: project.pictures,
            mode: mode
        }).match({ id: id })
        setLoading(false);
    }

    async function deleteDeck() {
        if (confirm('Are you sure you want to delete the project?')) { alert('Deck deleted') } else { return }
        const toRemove = project.pictures
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
                                Flashdex
                            </a>
                        </Link>
                        <div className="ml-8 flex-grow ">{project ? project.name : ''}</div>
                        <div className="mr-2"><Button variant="slim" className='text-lefttext-accents-0' onClick={() => saveDeck()}>Update</Button></div>
                    </div>
                    <div className='flex h-screen'>
                        <div className='flex-grow flex items-center bg-gray-200'>{project ? project.front
                            : 'This product doesn\'t contain any images'}
                        </div>
                        <div className='overflow-scroll w-80 bg-white p-6 drop-shadow-h-3'>
                            <div className='mt-14 mb-8'>
                                <label className='mb-2 text-lg font-bold block w-40'>Mode</label>
                                <p className='mb-4 text-sm text-gray-500'>Choose how the user will interact with the 360 viewer.</p>
                                <select className="border border-gray-200 rounded p-2 h-12 w-full" name="mode" form="mode" value={mode}
                                    onChange={(e) => {
                                        setMode(e.target.value)
                                    }}>
                                    <option value="autoplay">Autoplay</option>
                                    <option value="drag">Drag</option>
                                    <option value="hover">Hover</option>
                                </select>
                                {/*<div className='my-8'>
                                    <input type="checkbox" id="debug" name="debug" checked={debug} onChange={(e) => setDebug(!debug)} />
                                    <label name="debug"> Debug (show picture number in console) </label>
                        </div>
                                <div className='my-8'>
                                    <input type="checkbox" id="shadows" name="shadows" checked={shadows} onChange={e => setShadows(!shadows)} />
                                    <label name="shadows"> Shadows </label>
                                </div>*/}
                            </div>

                            <div className='my-8'>
                                <label className='mb-2 text-lg font-bold block'>Embed</label>
                                <p className='mb-4 text-sm text-gray-500'>Copy and paste this in your markup. <Link href={`/documentation`} ><a className='text-links'>Learn more</a></Link></p>
                                <div onClick={() => {
                                    navigator.clipboard.writeText(iframeCode)
                                    setCopied(true)
                                    setTimeout(() => {
                                        setCopied(false)
                                    }, 1000);
                                }}
                                    className='cursor-pointer transition hover:border-gray-400 w-full text-sm text-accents-2 break-words font-mono border rounded bg-primary-2 border-gray-200 p-4 min-h-2'>
                                    {copied ? 'Copied to your clipboard!' : iframeCode}
                                </div>
                            </div>
                            <div className='my-8'>
                                <label className='mb-4 text-lg font-bold block'>Images</label>
                                <div className="rounded max-h-48 overflow-scroll border border-gray-200 divide-y divide-gray-200">
                                </div>
                            </div>
                            <div className='my-8'>
                                <Button type="negative" variant="slim" className='text-red my-2 w-full' onClick={() => deleteDeck()}>Delete Deck</Button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div >
    )
}