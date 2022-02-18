import Viewer from '@/components/Viewer';
import LoadingDots from '@/components/ui/LoadingDots';
import { useRouter } from 'next/router';
import { useUser } from '@/utils/useUser';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase-client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { PoplarModal, PoplarLabel } from '@/components/ui/poplar-ui';


export default function DeckPage() {

    const { userLoaded, user, session, userDetails } = useUser();
    const [deck, setDeck] = useState(null);
    const [flashcards, setFlashcards] = useState(null);
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFlashcard, setNewFlashcard] = useState({});
    const [mode, setMode] = useState("edit");
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        if (!user) {
            // If no user, redirect to index.
            console.error('no user logged in')
            if (!user) router.replace('/');
        } else {
            getFlashcards()
        }
    }, [user])

    async function getFlashcards() {
        setLoading(true);
        let { data, error, status } = await supabase.from('flashcards').select('id, deck_id, front, back, learned').match({ deck_id: id })
        if (error) console.error('error', error.message)

        if (data && !error) {
            setFlashcards(data)
            getDeck();
        }
        setLoading(false);
    }
    async function getDeck() {
        let { data, error, status } = await supabase.from('decks').select('id, name').eq("id", id).single();
        if (error) console.error(error.message)
        console.log("deck data:", data);
        if (data && !error) {
            setDeck(data);
        }
    }

    async function saveFlashcards() {
        setLoading(true);
        const { data, error } = await supabase.from('flashcards').update({
            name: flashcards.name,
            pictures: flashcards.pictures,
            mode: mode
        }).match({ id: id })
        setLoading(false);
    }

    async function deleteFlashcards() {
        if (confirm('Are you sure you want to delete the flashcards?')) { alert('Flashcards deleted') } else { return }
        const { data, error } = await supabase.from('flashcards').delete().match({ id: id })
        if (!error) {
            router.push('/dashboard')
        }

    }

    async function createFlashcard() {
        setLoading(true)
        const newCard = {
            front: newFlashcard.front,
            back: newFlashcard.back,
            deck_id: id,
            learned: false
        }
        const { data, error } = await supabase.from('flashcards').insert(newCard)

        if (!error) {
            //router.push('/flashcards/' + data[0].id)
            setLoading(false);
            getFlashcards();
            setIsModalOpen(false);
        } else {
            console.log('Error', error)
            setLoading(false)
        }
    }

    const iframeCode = `<iframe width="500" height="500" src="${process.env.NEXT_PUBLIC_ROOT_URL}/embed/${id}" style="border: none;"></iframe>`

    switch (mode) {
        case 'review':
            return (
                <div>
                    {loading ? <div className='w-16 pt-16 mx-auto'><LoadingDots /></div> :
                        <div className='max-w-screen-md m-auto my-8 min-h-screen'>
                            <div className='flex items-center mb-4'>
                                <div className='text-lg font-semibold flex-grow'>{deck.name}</div>
                                <div>
                                    <Button variant='slim' onClick={() => { setMode('review') }}>Review</Button>
                                </div>
                            </div>
                            <Review flashcards={flashcards.filter(el => !el.learned)} />
                        </div>
                    }
                </div >
            )

        default:
            return (
                <div>
                    {loading ? <div className='w-16 pt-16 mx-auto'><LoadingDots /></div> :
                        <div>
                            <div className='max-w-screen-md m-auto my-8 min-h-screen'>
                                <div className='flex items-center mb-4'>
                                    <div className='text-lg font-semibold flex-grow'>{deck ? deck.name : 'Untitled'}</div>
                                    <div>
                                        <Button variant='slim' onClick={() => { setMode('review') }}>Review</Button>
                                    </div>
                                </div>
                                <div className='space-y-2'>{flashcards ?
                                    flashcards.map((flashcard, i) => (
                                        <div>
                                            <div className="flex bg-white py-4 px-6 rounded-lg filter drop-shadow-sm">
                                                <div className='flex-grow'>
                                                    {flashcard.front}
                                                </div>
                                                <div className=''>
                                                    {flashcard.back}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                    : 'This deck doesn\'t contain any flashcards'}
                                    <div onClick={() => { setIsModalOpen(true) }} className="cursor-pointer flex justify-center hover:bg-gray-100 py-4 px-6 rounded-lg border-2 border-dashed border-gray-200">
                                        Add card
                                    </div>
                                    <PoplarModal show={isModalOpen} title="New card" onClose={() => setIsModalOpen(false)}>
                                        <div>
                                            <PoplarLabel>Front</PoplarLabel>
                                            <Input placeholder="Front" onChange={(value) => setNewFlashcard({
                                                front: value,
                                                back: newFlashcard.back,
                                                deck_id: flashcards.deck_id,
                                            })}></Input>
                                        </div>
                                        <div>
                                            <PoplarLabel>Back</PoplarLabel>
                                            <Input placeholder="Back" onChange={(value) => setNewFlashcard({
                                                front: newFlashcard.front,
                                                back: value,
                                                deck_id: flashcards.deck_id,
                                            })}></Input>
                                        </div>
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
                                                onClick={() => { createFlashcard(newFlashcard) }}
                                            >Create</Button>
                                        </div>
                                    </PoplarModal>
                                </div>
                            </div>
                        </div>
                    }
                </div >
            )
    }
}

function Review({ flashcards }) {
    let [flipped, setFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    async function updateFlashcard(card, i, arr) {
        const { data, error } = await supabase.from('flashcards').update({
            front: card.front,
            back: card.back,
            deck_id: card.deck_id,
            learned: true
        }).match({ id: card.id })
        if (data & !error) {
            arr[i].learned = true;
        }
    }

    return (
        <div>
            <div className="bg-white w-full h-96 flex flex-col items-center justify-center rounded-xl filter drop-shadow-sm divide-y">
                <div className="py-4 font-bold text-4xl">{flashcards[currentIndex].front}</div>
                {flipped ? <div className="py-4 font-medium text-2xl">{flashcards[currentIndex].back}</div> : ''}
            </div>
            <div className="mt-4 flex justify-center space-x-2">
                <Button variant="slim" type="neutral">←</Button>
                <Button variant="slim" onClick={() => { setFlipped(true) }}>Flip</Button>
                <Button variant="slim" disabled={flashcards[currentIndex].learned} type="neutral" onClick={() => { updateFlashcard(flashcards[currentIndex], currentIndex, flashcards) }}>Mark as learned</Button>
                <Button variant="slim" type="neutral" onClick={() => {
                    setCurrentIndex(Math.floor(Math.random() * flashcards.length))
                    setFlipped(false)
                }}>→</Button>
            </div>
        </div >
    )
}