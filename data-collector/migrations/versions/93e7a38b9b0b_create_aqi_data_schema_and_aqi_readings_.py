"""create aqi_data schema and aqi_readings table

Revision ID: 93e7a38b9b0b
Revises: 
Create Date: 2024-10-26 22:28:11.032787

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '93e7a38b9b0b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS aqi_data;")
    op.create_table(
        'aqi_readings',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('timestamp', sa.TIMESTAMP, nullable=False),
        sa.Column('pm25', sa.Float, nullable=False),
        sa.Column('pm10', sa.Float, nullable=False),
        sa.Column('aqi_pm25', sa.Integer, nullable=False),
        sa.Column('aqi_pm10', sa.Integer, nullable=False),
        sa.Column('overall_aqi', sa.Integer, nullable=False),
        schema='aqi_data'
    )

def downgrade():
    op.drop_table('aqi_readings', schema='aqi_data')
    op.execute("DROP SCHEMA IF EXISTS aqi_data CASCADE;")
