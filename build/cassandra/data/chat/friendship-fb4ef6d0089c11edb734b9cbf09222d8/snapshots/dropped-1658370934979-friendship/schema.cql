CREATE TYPE IF NOT EXISTS chat.friendship (
    friendshipid uuid,
    user1 uuid,
    user2 uuid,
    datehour timestamp
);
CREATE TYPE IF NOT EXISTS chat.message (
    messageid uuid,
    messageowner uuid,
    messagedestination uuid,
    messagetext text,
    datehour timestamp
);
CREATE TYPE IF NOT EXISTS chat.conversation (
    conversationid uuid,
    messages frozen<set<frozen<message>>>,
    datehour timestamp,
    users frozen<set<uuid>>
);
CREATE TYPE IF NOT EXISTS chat.user (
    userid uuid,
    username text,
    friendships frozen<set<frozen<friendship>>>,
    conversations frozen<set<frozen<conversation>>>
);
CREATE TABLE IF NOT EXISTS chat.friendship (
    friendshipid uuid PRIMARY KEY,
    datehour timestamp,
    user1 user,
    user2 user
) WITH ID = fb4ef6d0-089c-11ed-b734-b9cbf09222d8
    AND additional_write_policy = '99p'
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND cdc = false
    AND comment = 'Query by friendships'
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '16', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    AND extensions = {}
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair = 'BLOCKING'
    AND speculative_retry = '99p';
