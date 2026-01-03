import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  rating_rapid: number | null;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend?: Profile;
}

interface Club {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  member_count: number;
  is_public: boolean;
  created_at: string;
  is_member?: boolean;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender?: Profile;
}

interface ClubMessage {
  id: string;
  club_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export const useConnect = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;

    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
      console.error('Error fetching friendships:', error);
      return;
    }

    const accepted: Friendship[] = [];
    const pending: Friendship[] = [];

    for (const friendship of friendships || []) {
      const friendId = friendship.requester_id === user.id 
        ? friendship.addressee_id 
        : friendship.requester_id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, username, avatar_url, rating_rapid')
        .eq('user_id', friendId)
        .single();

      const enrichedFriendship = { ...friendship, friend: profile } as Friendship;

      if (friendship.status === 'accepted') {
        accepted.push(enrichedFriendship);
      } else if (friendship.status === 'pending' && friendship.addressee_id === user.id) {
        pending.push(enrichedFriendship);
      }
    }

    setFriends(accepted);
    setPendingRequests(pending);
  };

  const fetchClubs = async () => {
    if (!user) return;

    const { data: allClubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .eq('is_public', true)
      .order('member_count', { ascending: false })
      .limit(10);

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError);
      return;
    }

    const { data: memberships } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user.id);

    const memberClubIds = new Set(memberships?.map(m => m.club_id) || []);

    const clubsWithMembership = (allClubs || []).map(club => ({
      ...club,
      is_member: memberClubIds.has(club.id)
    }));

    setClubs(clubsWithMembership);

    const myClubsList = clubsWithMembership.filter(c => c.is_member);
    setMyClubs(myClubsList);
  };

  const searchUsers = async (query: string): Promise<Profile[]> => {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, username, avatar_url, rating_rapid')
      .ilike('username', `%${query}%`)
      .neq('user_id', user?.id)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Friend request already sent');
      } else {
        toast.error('Failed to send friend request');
      }
      return;
    }

    toast.success('Friend request sent!');
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendshipId);

    if (error) {
      toast.error('Failed to accept friend request');
      return;
    }

    toast.success('Friend request accepted!');
    fetchFriends();
  };

  const declineFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast.error('Failed to decline friend request');
      return;
    }

    toast.success('Friend request declined');
    fetchFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast.error('Failed to remove friend');
      return;
    }

    toast.success('Friend removed');
    fetchFriends();
  };

  const createClub = async (name: string, description: string) => {
    if (!user) return null;

    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name,
        description,
        owner_id: user.id
      })
      .select()
      .single();

    if (clubError) {
      toast.error('Failed to create club');
      return null;
    }

    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        club_id: club.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) {
      console.error('Error adding owner as member:', memberError);
    }

    toast.success('Club created!');
    fetchClubs();
    return club;
  };

  const joinClub = async (clubId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Already a member of this club');
      } else {
        toast.error('Failed to join club');
      }
      return;
    }

    // Update member count
    const currentClub = clubs.find(c => c.id === clubId);
    if (currentClub) {
      await supabase
        .from('clubs')
        .update({ member_count: currentClub.member_count + 1 })
        .eq('id', clubId);
    }

    toast.success('Joined club!');
    fetchClubs();
  };

  const leaveClub = async (clubId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to leave club');
      return;
    }

    toast.success('Left club');
    fetchClubs();
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchFriends(), fetchClubs()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    friends,
    pendingRequests,
    clubs,
    myClubs,
    loading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    createClub,
    joinClub,
    leaveClub,
    refetch: () => Promise.all([fetchFriends(), fetchClubs()])
  };
};

export const useChat = (friendId?: string, clubId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<(DirectMessage | ClubMessage)[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;

    if (friendId) {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Fetch sender profiles
      const enrichedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id, username, avatar_url, rating_rapid')
            .eq('user_id', msg.sender_id)
            .single();
          return { ...msg, sender: profile } as DirectMessage;
        })
      );

      setMessages(enrichedMessages);
    } else if (clubId) {
      const { data, error } = await supabase
        .from('club_messages')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching club messages:', error);
        return;
      }

      const enrichedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id, username, avatar_url, rating_rapid')
            .eq('user_id', msg.sender_id)
            .single();
          return { ...msg, sender: profile } as ClubMessage;
        })
      );

      setMessages(enrichedMessages);
    }

    setLoading(false);
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    if (friendId) {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: friendId,
          content: content.trim()
        });

      if (error) {
        toast.error('Failed to send message');
        return;
      }
    } else if (clubId) {
      const { error } = await supabase
        .from('club_messages')
        .insert({
          club_id: clubId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        toast.error('Failed to send message');
        return;
      }
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up realtime subscription
    const table = friendId ? 'direct_messages' : 'club_messages';
    const channel = supabase
      .channel(`${table}-${friendId || clubId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id, username, avatar_url, rating_rapid')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage = { ...payload.new, sender: profile };
          
          if (friendId) {
            const dm = newMessage as DirectMessage;
            if (
              (dm.sender_id === user?.id && dm.receiver_id === friendId) ||
              (dm.sender_id === friendId && dm.receiver_id === user?.id)
            ) {
              setMessages(prev => [...prev, dm]);
            }
          } else if (clubId && (newMessage as ClubMessage).club_id === clubId) {
            setMessages(prev => [...prev, newMessage as ClubMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, friendId, clubId]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
};
