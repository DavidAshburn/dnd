class Equipment < ApplicationRecord
  has_and_belongs_to_many :gearpacks
end
