-- 失物招领表
drop table if exists lostandfound;
create table if not exists lostandfound(
	id integer not null primary key,
	openid text not null,
	name text not null,
	sex integer not null,
	phone text not null,
	losttime datetime not null,
	dept text not null,
	dest text not null,
	num integer not null default 1,
	lostlocation text not null,
	description text not null,
	logtime datetime not null default (datetime('now', 'localtime'))
);

-- 文明的士登记表
drop table if exists civilizedTexi;
create table if not exists civilizedTexi(
	id integer not null primary key,
	openid text not null,
	name text not null,
	sex integer not null,
	phone text not null,
	qcno text not null unique,
	company text not null,
	carno text not null,
	remark text,
	logtime datetime not null default (datetime('now', 'localtime'))
);

-- 好人好事记录表
drop table if exists goodRecord;
create table if not exists goodRecord(
	id integer not null primary key,
	name text not null,
	rType integer not null default 0,
	texiId integer not null,
	lafId integer,
	happenedTime datetime not null,
	score integer not null,
	logtime datetime not null default (datetime('now', 'localtime'))
);

-- 管理员信息表
drop table if exists adminInfo;
create table if not exists adminInfo(
	id integer not null primary key,
	username text not null unique,
	nickname text not null,
	password text not null default '12345',
	logtime datetime not null default (datetime('now', 'localtime'))
);