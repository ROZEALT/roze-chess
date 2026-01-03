import { useState } from 'react';
import { Users, MessageSquare, Trophy, UserPlus, Search, Check, X, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useConnect } from '@/hooks/useConnect';
import ChatWindow from '@/components/ChatWindow';
import CreateClubDialog from '@/components/CreateClubDialog';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  rating_rapid: number | null;
}

const Connect = () => {
  const { user } = useAuth();
  const {
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
    leaveClub
  } = useConnect();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    type: 'friend' | 'club';
    id: string;
    name: string;
  } | null>(null);
  const [createClubOpen, setCreateClubOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto chess-card p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
            Join the Community
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to connect with other players, join clubs, and make friends.
          </p>
          <Link to="/auth">
            <Button variant="glow">Sign In to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (activeChat) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto chess-card overflow-hidden">
          <ChatWindow
            friendId={activeChat.type === 'friend' ? activeChat.id : undefined}
            friendName={activeChat.type === 'friend' ? activeChat.name : undefined}
            clubId={activeChat.type === 'club' ? activeChat.id : undefined}
            clubName={activeChat.type === 'club' ? activeChat.name : undefined}
            onBack={() => setActiveChat(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Connect</h1>
        <p className="text-muted-foreground mb-8">Find friends, join clubs, and chat with the community.</p>

        {/* Search */}
        <div className="chess-card p-4 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search players by username..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
            </div>
            <Button variant="glow" onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Search Results</h3>
              {searchResults.map((result) => (
                <div 
                  key={result.id} 
                  className="flex items-center justify-between bg-secondary rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={result.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {result.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{result.username || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">Rating: {result.rating_rapid}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="game"
                    onClick={() => sendFriendRequest(result.user_id)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Friends
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="clubs" className="gap-2">
              <Trophy className="w-4 h-4" />
              Clubs
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="chess-card p-5">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Badge variant="destructive">{pendingRequests.length}</Badge>
                  Friend Requests
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between bg-secondary rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={request.friend?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {request.friend?.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{request.friend?.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">Rating: {request.friend?.rating_rapid}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => declineFriendRequest(request.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="chess-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-semibold text-lg text-foreground">Friends</h2>
                </div>
                <span className="text-sm text-muted-foreground">{friends.length} friends</span>
              </div>
              
              {loading ? (
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No friends yet</p>
                  <p className="text-sm text-muted-foreground">Search for players to add friends</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friendship) => (
                    <div 
                      key={friendship.id} 
                      className="flex items-center justify-between bg-secondary rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={friendship.friend?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {friendship.friend?.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{friendship.friend?.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">Rating: {friendship.friend?.rating_rapid}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="game"
                          onClick={() => setActiveChat({
                            type: 'friend',
                            id: friendship.friend!.user_id,
                            name: friendship.friend?.username || 'Unknown'
                          })}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeFriend(friendship.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Clubs Tab */}
          <TabsContent value="clubs" className="space-y-6">
            {/* My Clubs */}
            <div className="chess-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-semibold text-lg text-foreground">My Clubs</h2>
                </div>
                <Button variant="game" size="sm" onClick={() => setCreateClubOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Club
                </Button>
              </div>
              
              {myClubs.length === 0 ? (
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No clubs joined yet</p>
                  <p className="text-sm text-muted-foreground">Join a club or create your own</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myClubs.map((club) => (
                    <div 
                      key={club.id} 
                      className="bg-secondary rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{club.name}</h3>
                          <p className="text-sm text-muted-foreground">{club.member_count} members</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="game" 
                          size="sm"
                          onClick={() => setActiveChat({
                            type: 'club',
                            id: club.id,
                            name: club.name
                          })}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => leaveClub(club.id)}
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Browse Clubs */}
            <div className="chess-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-semibold text-lg text-foreground">Popular Clubs</h2>
                </div>
              </div>
              <div className="space-y-3">
                {clubs.filter(c => !c.is_member).map((club) => (
                  <div 
                    key={club.id} 
                    className="bg-secondary rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{club.name}</h3>
                        <p className="text-sm text-muted-foreground">{club.member_count} members</p>
                      </div>
                    </div>
                    <Button variant="game" size="sm" onClick={() => joinClub(club.id)}>
                      Join
                    </Button>
                  </div>
                ))}
                {clubs.filter(c => !c.is_member).length === 0 && (
                  <div className="bg-secondary rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No clubs available to join</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="chess-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-semibold text-lg text-foreground">Conversations</h2>
              </div>
              
              {friends.length === 0 && myClubs.length === 0 ? (
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No conversations</p>
                  <p className="text-sm text-muted-foreground">Add friends or join clubs to start chatting</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friendship) => (
                    <div 
                      key={friendship.id} 
                      className="bg-secondary rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => setActiveChat({
                        type: 'friend',
                        id: friendship.friend!.user_id,
                        name: friendship.friend?.username || 'Unknown'
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={friendship.friend?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {friendship.friend?.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{friendship.friend?.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">Direct Message</p>
                        </div>
                      </div>
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                  {myClubs.map((club) => (
                    <div 
                      key={club.id} 
                      className="bg-secondary rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => setActiveChat({
                        type: 'club',
                        id: club.id,
                        name: club.name
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{club.name}</p>
                          <p className="text-sm text-muted-foreground">Club Chat</p>
                        </div>
                      </div>
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateClubDialog
        open={createClubOpen}
        onOpenChange={setCreateClubOpen}
        onCreateClub={createClub}
      />
    </div>
  );
};

export default Connect;
