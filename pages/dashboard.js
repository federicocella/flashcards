import { useUser } from '@/utils/useUser';
import { supabase } from '@/utils/supabase-client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PoplarModal } from '@/components/ui/poplar-ui';

export const Deck = (props) => {
    const [profile, setProfile] = useState('')
    const [hover, setHover] = useState(false);

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);

    function useOutsideAlerter(ref) {
        useEffect(() => {
            /**
             * Alert if clicked on outside of element
             */
            function handleClickOutside(event) {
                if (ref.current && !ref.current.contains(event.target)) {
                    props.onClickOutside();
                }
            }

            // Bind the event listener
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                // Unbind the event listener on clean up
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    return (
        <div className="relative filter drop-shadow-h-1 bg-white rounded-lg w-64 
        flex-grow max-w-xs min-w-1/5 transition-all overflow-hidden"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}>
            {hover &&
                <div onClick={props.onMoreOptions}>
                    <img src='/ic24-more-hor.svg' className="absolute z-40 right-4 top-2 cursor-pointer">
                    </img>
                </div>}
            {props.selected ?
                <div ref={wrapperRef} className='absolute right-3 top-3 rounded-lg filter drop-shadow-h-2 z-50 bg-white py-2'>
                    <Link href={'/deck/' + props.proj.id}><a>
                        <div className='text-sm py-4 w-32 pl-4 hover:bg-accents-8 cursor-pointer'>
                            Edit
                        </div></a>
                    </Link>
                    <div className='text-sm py-4 w-32 pl-4 hover:bg-accents-8 cursor-pointer'
                        onClick={props.onDelete}>
                        Delete
                    </div>
                </div>
                : ''}
            <Link href={props.proj ? "/deck/" + props.proj.id : "/"}>
                <a>
                    <div className="relative w-full h-40 rounded-t-lg overflow-hidden z-30 bg-gray-100">
                        <div className={"t-0 absolute w-full h-full bg-black-fade z-20 transition duration-300 animate-none ease-in-out " + (hover ? "bg-opacity-20" : "opacity-0")}></div>
                        {profile && <img src={profile}
                            alt='profile pic'
                            layout='fill'
                            objectFit={'cover'}
                            className={"transform-gpu transition-transform duration-300 ease-in-out rounded-t-lg " + (hover ? 'scale-110 rounded-t-lg' : "")}
                        />}
                    </div>
                    <div className='mt-3 px-4 text-sm font-medium break-words mb-1 truncate'>{props.empty ? "..." : props.proj.name.split('.')[0]}</div>
                    <div className='mb-3 px-4 text-xs text-gray-400'>No flashcards</div>
                </a>
            </Link>
        </div >
    )
}


export default function Dashboard() {
    const [decks, setDecks] = useState([])
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const router = useRouter();
    const { user, signIn } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeckName, setNewDeckName] = useState("");

    useEffect(() => {
        allDecks()
        if (!user) router.replace('/signin');
    }, [user])


    async function allDecks() {
        setLoading(true)
        if (!user) return []
        const { data, error, status } = await supabase.from('decks').select('id, name');
        console.log('all decks ', data)
        if (error) throw error
        setLoading(false)
        setDecks(data)
    }

    async function deleteDeck(i) {

        const { data, error } = await supabase.from('decks').delete().match({ id: decks[i].id })
        console.log('deleted project ', data, error)
        const updatedDecks = decks.filter((p, j) => { return (i !== j) })
        setDecks(updatedDecks)
    }

    async function createDeck(name) {
        setLoading(true)
        const newDeck = {
            name: name,
        }
        const { data, error } = await supabase.from('decks').insert(newDeck)

        if (!error) {
            router.push('/deck/' + data[0].id)
            setLoading(false);
        } else {
            console.log('Error', error)
            setLoading(false)
        }
    }

    const skeleton = new Array(6).fill(" ");

    if (!user) {
        return (<div className='w-full text-center py-64'>User not found</div>)
    } else return (
        <div className='max-w-8xl mx-auto px-8 pt-8 mb-32'>
            <div className='flex items-center mb-8'>
                <div className='flex-grow'>
                    <h2 className='text-2xl font-bold mb-0.5'>All decks</h2>
                </div>

                {/*<Link href='/new'>
                    <a>
                        <Button
                            variant="slim"
                            loading={loading}
                        >
                            New
                        </Button>
                    </a>
    </Link>*/}
                <Button
                    variant="slim"
                    loading={loading}
                    onClick={() => { setIsModalOpen(true) }}
                >
                    New
                </Button>
                <PoplarModal title="New deck" onClose={() => setIsModalOpen(false)}
                    show={isModalOpen}>
                    <div className="mb-2 font-medium">Deck name</div>
                    <Input placeholder="Enter deck name" onChange={(value) => setNewDeckName(value)}></Input>
                    <div className="flex space-x-2 justify-end">
                        <Button
                            variant="slim"
                            type="neutral"
                            loading={loading}
                            onClick={() => { setIsModalOpen(false) }}
                        >Cancel</Button>
                        <Button
                            variant="slim"
                            loading={loading}
                            onClick={() => { createDeck(newDeckName) }}
                        >Create</Button>
                    </div>
                </PoplarModal>
            </div>
            <div className='flex gap-8 flex-wrap mb-12'>
                {loading ? skeleton.map((s, i) => <Deck empty key={i} />) :
                    decks.map((p, i) => <Deck proj={p} key={p.id} index={i} selected={i == selected}
                        onMoreOptions={() => setSelected(i)}
                        onClickOutside={() => setSelected(null)}
                        onDelete={() => deleteDeck(i)} />)}
                {!loading && !decks.length &&
                    <div className='w-full my-32 text-accents-4 text-center font-medium'>
                        <div className='mb-6'>There are no decks yet</div>
                        <Link href='/new'>
                            <a>
                                <Button
                                    variant="slim"
                                    loading={loading}>
                                    New project
                                </Button>
                            </a>
                        </Link>
                    </div>
                }
            </div>
        </div >)
}
